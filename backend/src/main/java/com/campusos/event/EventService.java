package com.campusos.event;

import com.campusos.common.AppException;
import com.campusos.room.Room;
import com.campusos.room.RoomRepository;
import com.campusos.user.Role;
import com.campusos.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final RoomRepository roomRepository;

    public EventService(EventRepository eventRepository,
                        EventRegistrationRepository eventRegistrationRepository,
                        RoomRepository roomRepository) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllEventsWithUserStatus(User currentUser) {
        List<Event> events = eventRepository.findAllByOrderByEventDateAsc();
        List<EventRegistration> userRegistrations = eventRegistrationRepository.findByUserId(currentUser.getId());
        Set<Long> registeredEventIds = userRegistrations.stream()
                .map(r -> r.getEvent().getId())
                .collect(Collectors.toSet());

        List<Map<String, Object>> result = new ArrayList<>();
        for (Event event : events) {
            long currentCount = eventRegistrationRepository.countByEventId(event.getId());
            Map<String, Object> map = new HashMap<>();
            map.put("id", event.getId());
            map.put("title", event.getTitle());
            map.put("description", event.getDescription());
            map.put("category", event.getCategory());
            map.put("eventDate", event.getEventDate());
            map.put("room", event.getRoom());
            map.put("venueName", event.getVenueName());
            map.put("organizer", event.getOrganizer());
            map.put("capacity", event.getCapacity());
            map.put("tag", event.getTag());
            map.put("registeredCount", currentCount);
            map.put("isFull", currentCount >= event.getCapacity());
            map.put("isRegistered", registeredEventIds.contains(event.getId()));
            map.put("isOrganizer", event.getOrganizer().getId().equals(currentUser.getId()) || currentUser.getRole() == Role.ADMIN);
            result.add(map);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Event not found with id: " + id));
    }

    public Event createEvent(String title, String description, EventCategory category,
                             LocalDateTime eventDate, Long roomId, String venueName,
                             int capacity, String tag, User organizer) {
        if (organizer.getRole() == Role.STUDENT) {
            throw AppException.forbidden("Students cannot publish campus events. Request through a Faculty advisor or Admin.");
        }

        Room room = null;
        if (roomId != null) {
            room = roomRepository.findById(roomId).orElse(null);
            if (venueName == null || venueName.isBlank()) {
                venueName = room != null ? room.getBuilding() + " - " + room.getRoomNumber() : "Campus Hall";
            }
        }

        Event event = new Event(title, description, category, eventDate, room, venueName, organizer, capacity, tag);
        return eventRepository.save(event);
    }

    // Slide 1 & 4: "Register or cancel, no duplicates. Capacity limits enforced."
    public EventRegistration register(Long eventId, User user) {
        Event event = getEventById(eventId);

        if (event.getEventDate().isBefore(LocalDateTime.now())) {
            throw AppException.badRequest("Cannot register for a past event");
        }

        // Check duplicate
        if (eventRegistrationRepository.existsByEventIdAndUserId(eventId, user.getId())) {
            throw AppException.conflict("You are already registered for this event");
        }

        // Check capacity
        long currentRegistrations = eventRegistrationRepository.countByEventId(eventId);
        if (currentRegistrations >= event.getCapacity()) {
            throw AppException.badRequest("Event capacity (" + event.getCapacity() + ") is full");
        }

        EventRegistration registration = new EventRegistration(event, user);
        return eventRegistrationRepository.save(registration);
    }

    public void cancelRegistration(Long eventId, User user) {
        EventRegistration registration = eventRegistrationRepository.findByEventIdAndUserId(eventId, user.getId())
                .orElseThrow(() -> AppException.notFound("You are not registered for this event"));

        eventRegistrationRepository.delete(registration);
    }

    @Transactional(readOnly = true)
    public List<User> getAttendees(Long eventId, User currentUser) {
        Event event = getEventById(eventId);

        // Slide 1: "Organizers see attendee lists"
        boolean canView = currentUser.getRole() == Role.ADMIN || event.getOrganizer().getId().equals(currentUser.getId());
        if (!canView) {
            throw AppException.forbidden("Only event organizers and administrators can view attendee lists");
        }

        return eventRegistrationRepository.findByEventId(eventId)
                .stream()
                .map(EventRegistration::getUser)
                .collect(Collectors.toList());
    }
}

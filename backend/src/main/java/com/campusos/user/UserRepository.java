package com.campusos.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE LOWER(TRIM(u.studentIdOrStaffId)) = LOWER(TRIM(:id))")
    Optional<User> findByStudentIdOrStaffIdIgnoreCase(@Param("id") String id);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE LOWER(TRIM(u.studentIdOrStaffId)) = LOWER(TRIM(:id))")
    boolean existsByStudentIdOrStaffIdIgnoreCase(@Param("id") String id);

    List<User> findByRole(Role role);
    List<User> findByRoleOrderByNameAsc(Role role);
}

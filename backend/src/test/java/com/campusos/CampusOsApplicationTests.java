package com.campusos;

import com.campusos.user.Role;
import com.campusos.user.User;
import com.campusos.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = CampusOsApplication.class)
class CampusOsApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void contextLoads() {
        assertNotNull(userRepository);
        assertNotNull(passwordEncoder);
    }

    @Test
    void testAdminManasExistsAndAuthorized() {
        User manas = userRepository.findByEmail("manas123@gmail.com").orElse(null);
        assertNotNull(manas, "Admin user manas123@gmail.com must exist in the database");
        assertEquals(Role.ADMIN, manas.getRole());
        assertTrue(passwordEncoder.matches("@123456789", manas.getPasswordHash()), "Password hash must match @123456789");
    }

}

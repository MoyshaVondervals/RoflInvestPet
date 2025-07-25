package org.moysha.investmentsPet.repositories;

import jakarta.transaction.Transactional;
import org.moysha.investmentsPet.enums.Role;
import org.moysha.investmentsPet.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

}

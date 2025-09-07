package org.moysha.investmentsPet.repositories;

import jakarta.transaction.Transactional;
import org.moysha.investmentsPet.enums.Role;
import org.moysha.investmentsPet.models.BrokerageAccount;
import org.moysha.investmentsPet.models.Stock;
import org.moysha.investmentsPet.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.username = :name WHERE u.id = :id")
    int updateUserNameById(Long id, String name);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.bio = :bio WHERE u.id = :id")
    int updateBioById(Long id, String bio);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.userAvatar = :userAvatar WHERE u.id = :id")
    int updateAvatarById(
            @Param("id") Long id,
            @Param("userAvatar") byte[] userAvatar
    );

    int deleteUserById(Long id);




}

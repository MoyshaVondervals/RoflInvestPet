package org.moysha.account_service.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.moysha.account_service.dto.ChangeProfileReq;
import org.moysha.account_service.dto.ProfileResp;
import org.moysha.account_service.enums.Role;
import org.moysha.account_service.exceptions.MessageException;
import org.moysha.account_service.models.BrokerageAccount;
import org.moysha.account_service.models.User;
import org.moysha.account_service.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final BrokerageAccountService brokerageAccountService;

    public User save(User user) {
        return repository.save(user);
    }

    public User create(User user) {
        if (repository.existsByUsername(user.getUsername())) {
            throw new MessageException("Пользователь с таким никнеймом уже существует");
        } else if (repository.existsByEmail(user.getEmail())) {
            throw new MessageException("Почта занята");
        }

        BrokerageAccount account = BrokerageAccount.builder()
                .user(user)
                .balance(BigDecimal.valueOf(1000))
                .createdAt(LocalDateTime.now())
                .build();

        user.setBrokerageAccount(account);

        return repository.save(user);
    }

    public User getByUsername(String username) {
        return repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));

    }

    public User loadUserById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден по id: " + id));
    }

    public UserDetailsService userDetailsService() {
        return this::getByUsername;
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User myUser) {
            return myUser;
        }
        throw new UsernameNotFoundException("Не удалось получить текущего пользователя");
    }

    @Transactional
    public void changeProfile(ChangeProfileReq request, MultipartFile logoFile) throws IOException {
        if (!Objects.equals(request.getUsername(), "") && !Objects.equals(request.getUsername(), getCurrentUser().getUsername())){
            if (request.getUsername().length() < 5 || request.getUsername().length() > 20) {
                throw new MessageException("Имя пользователя должно содержать от 5 до 20 символов включительно");
            }
            if (repository.existsByUsername(request.getUsername())) {
                throw new MessageException("Такое имя пользователя уже занято");
            }
            repository.updateUserNameById(getCurrentUser().getId(), request.getUsername());
        }
        if (!Objects.equals(request.getBio(), "")){
            if (request.getBio().length() > 300) {
                throw new MessageException("Био не может содержать более 300 символов");
            }
            repository.updateBioById(getCurrentUser().getId(), request.getBio());
        }
        if (logoFile != null && !(logoFile.isEmpty())) {
            repository.updateAvatarById(getCurrentUser().getId(), logoFile.getBytes());
        }

    }

    public ProfileResp getProfileInfo(){
        User user = getCurrentUser();
        ProfileResp profileResp = new ProfileResp(user.getUsername(), user.getBio(), user.getUserAvatar());
        return profileResp;
    }

    public void setRole() {
        var user = getCurrentUser();
        user.setRole(Role.ROLE_ADMIN);
        save(user);
    }
    public Role getUserRole(String username) {
        User user = getByUsername(username);
        return user.getRole();
    }

    @Transactional
    public void deleteUserAndBrockerageAccount() {
        User user = getCurrentUser();
        brokerageAccountService.deleteBrockerageAccount(user);
        repository.deleteUserById(user.getId());
    }

}

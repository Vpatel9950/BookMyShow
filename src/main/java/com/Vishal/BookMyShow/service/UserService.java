package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.dto.UserDto;
import com.Vishal.BookMyShow.exception.ResourceNotFoundException;
import com.Vishal.BookMyShow.model.User;
import com.Vishal.BookMyShow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserDto createUser(UserDto userDto){
       User user=mapToEntity(userDto);
       User savedUser=userRepository.save(user);
       return mapToDto(savedUser);
    }

    public UserDto getUserById(Long id){
        User user=userRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("User not found through this id: "+id));
        return mapToDto(user);
    }

    public List<UserDto> getAllUsers(){
        List<User>users=userRepository.findAll();
        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }




    private UserDto mapToDto(User user){
        UserDto userDto=new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setName(user.getName());
        userDto.setPhoneNumber(user.getPhoneNumber());
        return userDto;
    }

    private User mapToEntity(UserDto userDto) {
        User user=new User();
        user.setEmail(userDto.getEmail());
        user.setName(userDto.getName());
        user.setPhoneNumber(userDto.getPhoneNumber());
        return user;
    }

}

package com.lucive.models;

public record User(String username, String email, String invitationToken, String dateJoinedSeconds) {
}

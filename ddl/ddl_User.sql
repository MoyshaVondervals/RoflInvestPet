
CREATE SEQUENCE IF NOT EXISTS user_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE users
(
    id              BIGINT                      NOT NULL,
    username        VARCHAR(255)                NOT NULL,
    password        VARCHAR(255)                NOT NULL,
    email           VARCHAR(255)                NOT NULL,
    investor_status VARCHAR(255)                NOT NULL,
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    role            VARCHAR(255)                NOT NULL,
    bio             VARCHAR(255),
    user_avatar     BYTEA,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

ALTER TABLE users
    ADD CONSTRAINT uc_users_email UNIQUE (email);

ALTER TABLE users
    ADD CONSTRAINT uc_users_username UNIQUE (username);
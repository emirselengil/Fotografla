package com.fotografla.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
class FotograflaBackendApplicationTests {

	@Container
	@SuppressWarnings("resource")
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
			.withDatabaseName("fotografla_test")
			.withUsername("postgres")
			.withPassword("postgres");

	@DynamicPropertySource
	static void configureDatasource(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", postgres::getJdbcUrl);
		registry.add("spring.datasource.username", postgres::getUsername);
		registry.add("spring.datasource.password", postgres::getPassword);
		registry.add("app.security.jwt.secret", () -> "test-jwt-secret-minimum-32-bytes-long-key!!");
		registry.add("app.security.jwt.expiration-seconds", () -> "3600");
	}

	@Test
	void contextLoads() {
	}

}

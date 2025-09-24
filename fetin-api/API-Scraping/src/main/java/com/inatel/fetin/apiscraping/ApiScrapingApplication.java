package com.inatel.fetin.apiscraping;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ApiScrapingApplication {

	public static void main(String[] args) {

        SpringApplication.run(ApiScrapingApplication.class, args);
    }

}

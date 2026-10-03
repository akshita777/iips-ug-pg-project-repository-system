package com.iips.pms.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI projectPortalApi() {
        return new OpenAPI().info(new Info()
                .title("IIPS Project Portal API")
                .description("Academic project repository and record management for BCA and MCA programs")
                .version("1.0"));
    }
}

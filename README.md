# IncomeUI

Overview
Rest API for managing monthly fees for a neighborhood

Setup
Microprofile project featuring Jersey Rest API and EJB for scheduled tasks

Java JDK 8+
Maven 3+
Payara Micro

Clone project from repository
Sync project dependencies. Go to project root:
     mvn clean install
Run
Ejecutar el siguiente comando para servir la aplicación utilizando tomcat embebido en la aplicación

    ./mvnw spring-boot run
Build
Para empaquetado war del proyect

    mvn clean package
Nota
Si se va a servir la aplicación utilizando el tomcat embebido, comentar el scope en la dependencia, para que se incluya el servidor dentro de la aplicación

 <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-tomcat</artifactId>
      <!--scope>provided</scope-->
 </dependency>

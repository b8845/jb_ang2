package angulartest.service;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import angulartest.mongodb.MongoClientProvider;

import javax.annotation.security.PermitAll;
import javax.ejb.Stateless;
import javax.inject.Inject;

@Slf4j
@Stateless
@PermitAll
public class TestService {

    @Inject
    @Getter
    private MongoClientProvider provider;


}
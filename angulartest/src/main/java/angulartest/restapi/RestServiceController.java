package angulartest.restapi;

import lombok.extern.slf4j.Slf4j;
import angulartest.mongodb.MongoClientProvider;

import javax.faces.bean.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@RequestScoped
@Path("/testrestservice/")
@Produces({MediaType.APPLICATION_JSON})
@Slf4j
public class RestServiceController {

    private static final String CONSUMEDMEDIATYPE = MediaType.APPLICATION_JSON;
    private static final String PRODUCTEDMEDIATYPE = MediaType.APPLICATION_JSON + "; charset=UTF-8";

    @Inject
    private MongoClientProvider provider;


    @POST
    @Consumes(CONSUMEDMEDIATYPE)
    @Produces(PRODUCTEDMEDIATYPE)
    public Response saveQuestionnaireTemplate() {
        return Response.ok().build();
    }

    @GET
    @Path("{templateId}")
    @Produces(PRODUCTEDMEDIATYPE)
    public Response getQuestionnaireTemplate(@PathParam("templateId") final Long templateId ) {
        return Response.ok().build();
    }
}
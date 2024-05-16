package fr.mickaelbaron.jaxrstutorialexercice1;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("hello")
@Produces(MediaType.TEXT_PLAIN)
public class HelloResource {

    @GET
    public String getHello() {
        return "Bonjour ENSMA";
    }

    @GET
    @Path("{id}")
    public String getHello(@PathParam("id") String id,
                           @DefaultValue("votre serviteur") @HeaderParam("name") String name) {
        return "Bonjour " + id + " de la part de " + name;
    }

    @GET
    @Path("withheaders/{id}")
    public Response getHelloWithHeaders(@PathParam("id") String id,
                                        @DefaultValue("votre serviteur") @HeaderParam("name") String name) {
        return Response.ok().header("name", name).entity("Bonjour " + id + " de la part de (voir l'en-tête).").build();
    }
}

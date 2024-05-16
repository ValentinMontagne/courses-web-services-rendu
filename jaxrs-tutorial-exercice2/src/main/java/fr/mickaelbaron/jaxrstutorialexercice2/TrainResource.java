package fr.mickaelbaron.jaxrstutorialexercice2;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Optional;

@Path("/trains")
@Produces({"application/json", "application/xml"})
public class TrainResource {

    public TrainResource() { }

    @GET
    // TODO: préciser le verbe HTTP.
    public List<Train> getTrains() {
        System.out.println("getTrains");

        return TrainBookingDB.getTrains();
    }

    @GET
    @Path("/trainid-{trainId}")
    // TODO: préciser le verbe HTTP
    // TODO: le chemin doit commencer par `/trainid-`  et se finir
    // par un template paramètre désignant l'identifiant du train.
    public Train getTrain(@PathParam("trainId") String trainId) {
        System.out.println("getTrain");

        Optional<Train> trainById = TrainBookingDB.getTrainById(trainId);

        if (trainById.isPresent()) {
            return trainById.get();
        } else {
            throw new NotFoundException("Train not found");
            // TODO: déclencher une exception avec un statut NOT_FOUND.
        }
    }

    // TODO: préciser le verbe HTTP.
    // TODO: le chemin doit commencer par `/search`.
    // Les paramètres sont tous des paramètres de requête.
    @GET
    @Path("/search")
    public Response searchTrainsByCriteria(
            @QueryParam("departure") String departure,
            @QueryParam("arrival") String arrival,
            @QueryParam("departureTime") String departureTime) {

        // Affichage des paramètres de requête
        System.out.println("Departure: " + departure);
        System.out.println("Arrival: " + arrival);
        System.out.println("Departure Time: " + departureTime);

        // Retourner une réponse avec les trois paramètres de requête en en-tête
        // et un sous-ensemble de la liste des trains
        // Exemple de sous-ensemble de trains : TrainBookingDB.getTrains().subList(0, 2)
        List<Train> trainsSubset = TrainBookingDB.getTrains().subList(0, 2);

        return Response
                .ok(trainsSubset)
                .header("departure", departure)
                .header("arrival", arrival)
                .header("departureTime", departureTime)
                .build();
    }


    @Path("/bookings") // Path de la sous-ressource
    public TrainBookingResource getTrainBookingResource() {
        System.out.println("TrainResource.getTrainBookingResource()");
        return new TrainBookingResource();
    }
}

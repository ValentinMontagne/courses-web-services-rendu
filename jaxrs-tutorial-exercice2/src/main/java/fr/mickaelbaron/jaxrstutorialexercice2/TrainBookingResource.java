package fr.mickaelbaron.jaxrstutorialexercice2;

import jakarta.ws.rs.*;

import java.util.List;
import java.util.Optional;

@Path("/trainbookings")
@Produces({"application/json", "application/xml"})
@Consumes({"application/json", "application/xml"})
public class TrainBookingResource {

    public TrainBookingResource() {
    }

    @POST
    public TrainBooking createTrainBooking(TrainBooking trainBooking) {
        System.out.println("TrainBookingResource.createTrainBooking()");

        Optional<Train> findFirst = TrainBookingDB.getTrainById(trainBooking.getTrainId());

        if (!findFirst.isPresent()) {
            throw new NotFoundException("Train not found");
            // TODO: déclencher une exception avec un statut NOT_FOUND.
        }

        TrainBooking newBookTrain = new TrainBooking();
        newBookTrain.setNumberPlaces(trainBooking.getNumberPlaces());
        newBookTrain.setTrainId(findFirst.get().getId());
        newBookTrain.setId(Long.toString(System.currentTimeMillis()));

        TrainBookingDB.getTrainBookings().add(newBookTrain);

        return newBookTrain;
    }

    @GET
    public List<TrainBooking> getTrainBookings() {
        System.out.println("TrainBookingResource.getTrainBookings()");

        return TrainBookingDB.getTrainBookings();
    }


    @GET
    @Path("/{trainBookingId}")
    public TrainBooking getTrainBooking(@PathParam("trainBookingId") String trainBookingId) {
        System.out.println("TrainBookingResource.getTrainBooking()");

        Optional<TrainBooking> findFirst = TrainBookingDB.getTrainBookingById(trainBookingId);

        if (findFirst.isPresent()) {
            return findFirst.get();
        } else {
            throw new NotFoundException("Train booking not found");
            // TODO: déclencher une exception avec un statut NOT_FOUND.
        }
    }

    // TODO: préciser le verbe HTTP.
    // TODO: template paramètre désignant l'identifiant du train.
    @DELETE
    @Path("/{trainBookingId}")
    public void removeTrainBooking(@PathParam("trainBookingId") String trainBookingId) {
        System.out.println("TrainBookingResource.removeTrainBooking()");

        Optional<TrainBooking> findFirst = TrainBookingDB.getTrainBookingById(trainBookingId);

        if (findFirst.isPresent()) {
            TrainBookingDB.getTrainBookings().remove(findFirst.get());
        } else {
            throw new NotFoundException("Train booking not found");
        }
    }
}

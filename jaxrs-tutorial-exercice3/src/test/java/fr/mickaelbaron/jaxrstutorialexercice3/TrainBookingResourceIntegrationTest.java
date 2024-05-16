package fr.mickaelbaron.jaxrstutorialexercice3;

import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import org.junit.Assert;

import static jakarta.ws.rs.sse.SseEventSource.target;

/**
 * @author Mickael BARON (baron.mickael@gmail.com)
 */
public class TrainBookingResourceIntegrationTest {
		
	private TrainBooking createTrainBooking(String trainId, int numberPlaces) {
		TrainBooking trainBooking = new TrainBooking();
		trainBooking.setNumberPlaces(numberPlaces);
		trainBooking.setTrainId(trainId);
		Response response = target("/trains/bookings").request(MediaType.APPLICATION_JSON_TYPE).post(Entity.entity(trainBooking, MediaType.APPLICATION_JSON));
		Assert.assertEquals("Http Response should be 200: ", Status.OK.getStatusCode(), response.getStatus());
				
		return response.readEntity(TrainBooking.class);
	}

	private WebTarget target(String path) {
		return target("http://localhost:9992/api" + path);
	}
}

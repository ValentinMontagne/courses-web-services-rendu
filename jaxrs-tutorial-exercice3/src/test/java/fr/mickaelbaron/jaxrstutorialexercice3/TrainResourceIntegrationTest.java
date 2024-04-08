package fr.mickaelbaron.jaxrstutorialexercice3;

import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.GenericType;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import org.glassfish.jersey.logging.LoggingFeature;
import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.test.JerseyTest;
import org.junit.Assert;
import org.junit.Test;

import java.util.List;
import java.util.logging.Level;

/**
 * @author Mickael BARON (baron.mickael@gmail.com)
 */
public class TrainResourceIntegrationTest extends JerseyTest {

	@Override
	protected Application configure() {
		ResourceConfig resourceConfig = new ResourceConfig(TrainResource.class);
		resourceConfig.property(LoggingFeature.LOGGING_FEATURE_LOGGER_LEVEL_SERVER, Level.WARNING.getName());
		return resourceConfig;
	}

	@Test
	public void getTrainTest() {
		// Given
		String trainId = "TR123";
		String url = "http://localhost:9992/api/trains/trainid-" + trainId;

		// When
		Client client = ClientBuilder.newClient();
		Response response = client.target(url)
				.request(MediaType.APPLICATION_JSON)
				.get();

		// Then
		Assert.assertEquals("Http Response should be 200: ", 200, response.getStatus());
		Assert.assertEquals(MediaType.APPLICATION_JSON_TYPE, response.getMediaType());

		Train readEntity = response.readEntity(Train.class);
		Assert.assertNotNull(readEntity);
		Assert.assertEquals("Poitiers", readEntity.getDeparture());

		// Closing the client
		response.close();
		client.close();
	}

	@Test
	public void searchTrainsByCriteriaTest() {
		// Given
		String departure = "Poitiers";
		String arrival = "Paris";
		String departureTime = "1710";
		String url = "http://localhost:9992/api/trains/search";

		// When
		Client client = ClientBuilder.newClient();
		Response response = client.target(url)
				.queryParam("departure", departure)
				.queryParam("arrival", arrival)
				.queryParam("departureTime", departureTime)
				.request(MediaType.APPLICATION_JSON)
				.get();

		// Then
		Assert.assertEquals("Http Response should be 200: ", 200, response.getStatus());

		Assert.assertTrue("Response should contain departure header", response.getHeaderString("departure").equals(departure));
		Assert.assertTrue("Response should contain arrival header", response.getHeaderString("arrival").equals(arrival));
		Assert.assertTrue("Response should contain departureTime header", response.getHeaderString("departureTime").equals(departureTime));

		List<Train> trains = response.readEntity(new GenericType<List<Train>>() {});
		Assert.assertEquals("Response should contain two trains", 2, trains.size());

		// Closing the client
		response.close();
		client.close();
	}
}

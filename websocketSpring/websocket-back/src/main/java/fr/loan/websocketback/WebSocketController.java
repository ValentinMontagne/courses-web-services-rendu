package fr.loan.websocketback;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @MessageMapping("/app/chat")
    @SendTo("/topic/messages")
    public String sendMessage(String message) {
        return message;
    }
}

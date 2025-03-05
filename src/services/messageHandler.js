import whatsappService from "./whatsappService.js";

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === "text") {
      const incomingMessage = message.text.body.toLowerCase().trim();
      const userId = message.from;

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(userId, message.id, senderInfo);
        await this.sendWelcomeMenu(userId);
      } else {
        await this.handleUserResponse(userId, incomingMessage, message.id);
      }

      await whatsappService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas", "buenas tardes"];
    return greetings.some((greet) => message.includes(greet));
  }

  getSenderName(senderInfo) {
    return senderInfo?.profile?.name || senderInfo?.wa_id || "Cliente";
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const welcomeMessage = `Hola ${name}, Bienvenido al chatbot. ¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una opción:";
    const buttons = [
      { type: "reply", reply: { id: "option_1", title: "📅 Agendar" } },
      { type: "reply", reply: { id: "option_2", title: "📄 Consultar" } },
      { type: "reply", reply: { id: "option_3", title: "📍 Ubicación" } },
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  async handleUserResponse(to, message, messageId) {
    let response = "";

    switch (message) {
      case "option_1":
        response =
          "📅 Para agendar una cita, por favor indícanos la fecha y hora que prefieres.";
        break;
      case "option_2":
        response =
          "📄 ¿Sobre qué te gustaría consultar? Tenemos información sobre productos, servicios y más.";
        break;
      case "option_3":
        response =
          "📍 Nuestra tienda está ubicada en [dirección aquí]. También puedes visitarnos en Google Maps: [link].";
        break;
      default:
        response =
          "⚠️ No entendí tu respuesta. Por favor, selecciona una opción válida.";
        break;
    }

    await whatsappService.sendMessage(to, response, messageId);
  }
}

export default new MessageHandler();

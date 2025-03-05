import whatsappService from "./whatsappService.js";

class MessageHandler {
  // Maneja los mensajes entrantes desde WhatsApp
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === "text") {
      const incomingMessage = message.text.body.toLowerCase().trim();
      const userId = message.from;

      // Verifica si el mensaje es un saludo y responde con el menú inicial
      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(userId, message.id, senderInfo);
        await this.sendWelcomeMenu(userId);
      } else {
        // Maneja respuestas del usuario fuera del menú inicial
        await this.handleUserResponse(userId, incomingMessage, message.id);
      }

      // Marca el mensaje como leído en WhatsApp
      await whatsappService.markAsRead(message.id);
    } else if (message?.type === "interactive") {
      // Captura la opción seleccionada en un botón interactivo
      const option = this.cleanText(message?.interactive?.button_reply?.title);
      await this.handleMenuOption(message.from, option);

      // Marca el mensaje como leído en WhatsApp
      await whatsappService.markAsRead(message.id);
    }
  }

  // Verifica si un mensaje es un saludo
  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas", "buenas tardes"];
    return greetings.some((greet) => message.includes(greet));
  }

  // Obtiene el nombre del remitente, si está disponible
  getSenderName(senderInfo) {
    return senderInfo?.profile?.name || senderInfo?.wa_id || "Cliente";
  }

  // Envía un mensaje de bienvenida al usuario
  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const welcomeMessage = `Hola ${name}, Bienvenido al chatbot. Cambiamos realidades, creamos futuro. ¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  // Envía un menú interactivo con opciones al usuario
  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una opción:";
    const buttons = [
      { type: "reply", reply: { id: "option_1", title: "📅 Agendar" } },
      { type: "reply", reply: { id: "option_2", title: "📄 Consultar" } },
      { type: "reply", reply: { id: "option_3", title: "📍 Ubicación" } },
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  // Maneja la respuesta del usuario según su mensaje
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

  // Maneja las opciones seleccionadas desde botones interactivos
  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case "Agendar":
        response = "Agendar Cita";
        break;
      case "Consultar":
        response = "Realiza tu consulta";
        break;
      case "Ubicación":
        response = "Esta es nuestra ubicación";
        break;
      default:
        response =
          "Lo siento, no entendí tu selección. Por favor, elige una de las opciones del menú.";
    }
    await whatsappService.sendMessage(to, response);
  }

  // Limpia el texto eliminando caracteres especiales
  cleanText(text) {
    return text.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]/g, "").trim();
  }
}

export default new MessageHandler();

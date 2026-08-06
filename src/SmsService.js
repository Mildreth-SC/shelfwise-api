/**
 * SmsService — envío simulado de OTP/2FA (tipo Twilio).
 * No envía SMS reales; registra en memoria para demos/tests.
 */
class SmsService {
  constructor() {
    this.enviados = [];
  }

  /**
   * @param {string} telefono
   * @param {string} codigo
   */
  enviarSMS(telefono, codigo) {
    const registro = { telefono, codigo, enviadoEn: Date.now() };
    this.enviados.push(registro);
    console.log(`[SMS simulado] -> ${telefono}: código ${codigo}`);
    return registro;
  }
}

module.exports = { SmsService };

import { Injectable, Logger } from '@nestjs/common';
import { envs } from '../config/envs';
import { EmailOptions } from '../core/models/email-options.model';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: envs.MAILER_SERVICE,
      auth: {
        user: envs.MAILER_EMAIL,
        pass: envs.MAILER_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: envs.MAILER_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Correo enviado a ${options.to}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo: ${error.message}`);
      throw error;
    }
  }

  buildFoundPetEmail(foundPet: any, lostPet: any): string {
    const mapUrl =
      `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
      `pin-s+ff0000(${lostPet.lost_lng},${lostPet.lost_lat}),` +
      `pin-s+00ff00(${foundPet.found_lng},${foundPet.found_lat})/` +
      `auto/600x300@2x?access_token=${envs.MAPBOX_TOKEN}`;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e74c3c;">🐾 PetRadar - Posible coincidencia encontrada</h1>
        
        <p>Hola <strong>${lostPet.owner_name}</strong>,</p>
        <p>Se encontró una mascota cerca de donde perdiste a <strong>${lostPet.name}</strong>. 
        ¡Podría ser él/ella!</p>

       <h2 style="color: #2c3e50;">Mascota encontrada</h2>
       <ul>
          <li><strong>Especie:</strong> ${foundPet.species}</li>
          <li><strong>Raza:</strong> ${foundPet.breed ?? 'No identificada'}</li>
          <li><strong>Color:</strong> ${foundPet.color}</li>
          <li><strong>Tamaño:</strong> ${foundPet.size}</li>
          <li><strong>Descripción:</strong> ${foundPet.description}</li>
          <li><strong>Dirección:</strong> ${foundPet.address}</li>
       </ul>

        ${foundPet.photo_url ? `<img src="${foundPet.photo_url}" alt="Foto de la mascota encontrada" style="width: 100%; max-width: 400px; border-radius: 8px; margin: 10px 0;" />` : ''}

        <h2 style="color: #2c3e50;">Contacto de quien la encontró</h2>
        <ul>
          <li><strong>Nombre:</strong> ${foundPet.finder_name}</li>
          <li><strong>Correo:</strong> ${foundPet.finder_email}</li>
          <li><strong>Teléfono:</strong> ${foundPet.finder_phone}</li>
        </ul>

        <h2 style="color: #2c3e50;">Mapa</h2>
        <img src="${mapUrl}" alt="Mapa de ubicaciones" style="width: 100%; border-radius: 8px;" />
        <p>
          🔴 Donde se perdió ${lostPet.name}<br/>
          🟢 Donde fue encontrada la mascota
        </p>

        <p style="color: #7f8c8d; font-size: 12px;">
          Este correo fue enviado automáticamente por PetRadar.
        </p>
      </div>
    `;
  }
}
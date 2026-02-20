import axios from "axios"
import { config } from "../config/dotenv";
import { NotificationEmail } from "../models/NotificationEmail";
import { CustomError } from "../types/CustomError";
import { NotificationPayload } from "../types/notification";
import { Repository } from "typeorm";

function coerceAuthorizedApps(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(v => String(v)).filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([app]) => String(app));
  }
  return [];
}

export class NotificationService {
  private apikey: string;
  private apiUrl: string;
  private notificationRepository: Repository<NotificationEmail>;

  constructor(notificationRepository: Repository<NotificationEmail>) {
    this.apikey = config.notification.apiKey;
    this.apiUrl = config.notification.apiUrl;
    this.notificationRepository = notificationRepository;
  }

  async sendNotification(payload: NotificationPayload) {
    try {
      await axios.post(`${this.apiUrl}/notification`, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apikey
        }
      })
    } catch (error) {
      throw new CustomError('Erro ao enviar notificação', 500);
    }
  }

  async isNotificationEnabled(registration: string, dassOffice: string) {
    try {
      const userEmail = await this.notificationRepository.findOne({
        where: {
          userEmail: {
            matricula: registration,
          },
          unidadeDass: dassOffice
        },
      })

      if (!userEmail) {
        console.log("Notificações desabilitadas para este usuário.");
        return;
      }

      const authorizedApps = userEmail.authorizedNotificationsApps
      const isNotificationEnabled = coerceAuthorizedApps(authorizedApps).includes("automation")

      return isNotificationEnabled;
    } catch (error: any) {
      const errorMessage = error instanceof CustomError ? error.message : "Erro Interno no servidor!";
      console.error("Error checking notification enabled:", errorMessage);
      throw error;
    }
  }

  async getUserEmail(registration: string, dassOffice: string) {
    try {
      const userEmail = await this.notificationRepository.findOne({
        where:{
          userEmail: {
            matricula: registration,
          },
          unidadeDass: dassOffice
        
        }
      })

      return userEmail?.email;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }

      throw new CustomError("Erro ao buscar email do usuario", 500)
    }
  }
}
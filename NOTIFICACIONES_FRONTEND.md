# 📱 Guía de Integración: Notificaciones en Tiempo Real + Persistentes

## Backend completado ✅

El backend ahora soporta:
- **Base de datos**: Tablas `Notification` y `NotificationType`
- **WebSockets**: Socket.IO configurado en `src/server.js`
- **APIs REST**: Endpoints para gestionar notificaciones
- **Hooks automáticos**: Notificaciones disparadas en eventos (reservas, invitaciones)
- **Reminders**: Cron job cada 1 minuto para notificaciones de reservas próximas

---

## 🔧 Frontend: Instalación

### 1. Instalar Socket.IO client

```bash
npm install socket.io-client
```

### 2. Crear servicio de Socket.IO

Crea `src/services/socketService.ts` (o `.js`):

```typescript
import io from 'socket.io-client';

let socket: any = null;

export const initializeSocket = (token: string) => {
    if (socket && socket.connected) return socket;

    socket = io('http://localhost:3000', {
        auth: {
            token: token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('✅ Socket conectado:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket desconectado');
    });

    socket.on('notification', (notification: any) => {
        console.log('📬 Nueva notificación:', notification);
        // Aquí disparas tu lógica para mostrar la notificación
        handleNotification(notification);
    });

    socket.on('error', (error: any) => {
        console.error('Socket error:', error);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) socket.disconnect();
};

// Función para manejar notificaciones recibidas
const handleNotification = (notification: any) => {
    // Mostrar toast, badge, sonido, etc.
    console.log('Notificación:', notification.title, notification.body);
};
```

---

## 🌐 Endpoints de la API

### Base URL: `http://localhost:3000/notifications`

#### 1. Obtener notificaciones paginadas

```
GET /notifications?limit=20&offset=0
Authorization: Bearer <TOKEN>
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "12345",
      "type": "reserva_created",
      "title": "Reserva confirmada",
      "body": "Tu reserva en \"Biblioteca UAS\" fue creada exitosamente",
      "data": { "reservaId": 1, "resourceId": 5, "siteId": 2 },
      "read": false,
      "createdAt": "2025-12-12T10:30:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

#### 2. Obtener notificaciones no leídas

```
GET /notifications/unread/list
Authorization: Bearer <TOKEN>
```

#### 3. Contar notificaciones no leídas

```
GET /notifications/unread/count
Authorization: Bearer <TOKEN>
```

**Response:**
```json
{
  "unreadCount": 5
}
```

#### 4. Marcar como leídas (múltiples)

```
POST /notifications/mark-read
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "notificationIds": ["12345", "12346", "12347"]
}
```

#### 5. Marcar todas como leídas

```
POST /notifications/mark-all-read
Authorization: Bearer <TOKEN>
```

#### 6. Eliminar notificación

```
DELETE /notifications/:id
Authorization: Bearer <TOKEN>
```

---

## 📲 Tipos de Notificaciones

| Tipo | Cuándo se dispara |
|------|-------------------|
| `reserva_created` | Cuando creas una reserva |
| `reserva_cancelled_admin` | Cuando un admin cancela tu reserva |
| `reserva_reminder_15min` | 15 minutos antes de que comience tu reserva |
| `reserva_ending_15min` | 15 minutos antes de que termine tu reserva |
| `reserva_ended` | Cuando tu reserva termina |
| `invitation_received` | Cuando recibes una invitación a un grupo |
| `invitation_accepted` | Cuando alguien acepta tu invitación |
| `invitation_rejected` | Cuando alguien rechaza tu invitación |
| `group_member_removed` | Cuando te remueven de un grupo |

---

## 🛠️ Ejemplo de componente Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { initializeSocket, getSocket, disconnectSocket } from '@app/services/socketService';
import { AuthService } from '@app/services/auth.service';
import { NotificationsService } from '@app/services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  unreadCount: number = 0;

  constructor(
    private authService: AuthService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    // Obtener token
    const token = this.authService.getToken();
    if (token) {
      // Inicializar Socket.IO
      initializeSocket(token);
      
      // Cargar notificaciones iniciales
      this.loadNotifications();
      this.updateUnreadCount();
    }
  }

  loadNotifications() {
    this.notificationsService.getNotifications(0, 20).subscribe(result => {
      this.notifications = result.notifications;
    });
  }

  updateUnreadCount() {
    this.notificationsService.getUnreadCount().subscribe(result => {
      this.unreadCount = result.unreadCount;
    });
  }

  markAsRead(notificationIds: string[]) {
    this.notificationsService.markAsRead(notificationIds).subscribe(() => {
      this.loadNotifications();
      this.updateUnreadCount();
    });
  }

  markAllAsRead() {
    this.notificationsService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
      this.updateUnreadCount();
    });
  }

  deleteNotification(notificationId: string) {
    this.notificationsService.deleteNotification(notificationId).subscribe(() => {
      this.loadNotifications();
      this.updateUnreadCount();
    });
  }

  ngOnDestroy() {
    disconnectSocket();
  }
}
```

---

## 🎨 Ejemplo de servicio HTTP (Angular)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl = 'http://localhost:3000/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(offset: number = 0, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}?limit=${limit}&offset=${offset}`);
  }

  getUnreadNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread/list`);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread/count`);
  }

  markAsRead(notificationIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-read`, { notificationIds });
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-all-read`, {});
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`);
  }
}
```

---

## 🔄 Flujo completo

1. **Usuario inicia sesión** → Se obtiene el JWT
2. **Se conecta Socket.IO** → Se pasa el JWT en `auth.token`
3. **Backend autentica la conexión** → Se asigna el `userId` al socket
4. **Socket se une a room** → `user:${userId}`
5. **Un evento ocurre** (ej: crear reserva) → Backend crea notificación en BD
6. **Backend emite por Socket** → `io.to('user:${userId}').emit('notification', {...})`
7. **Frontend recibe en tiempo real** → `socket.on('notification', ...)`
8. **Usuario también puede consultar la API** → `GET /notifications` (para cargar al entrar a la app)

---

## ✅ Checklist para el Frontend

- [ ] Instalar `socket.io-client`
- [ ] Crear `socketService.ts`
- [ ] Crear `notificationsService.ts` (HTTP)
- [ ] Inicializar socket al login
- [ ] Escuchar `socket.on('notification', ...)`
- [ ] Implementar UI para mostrar notificaciones
- [ ] Cargar notificaciones al abrir la app
- [ ] Implementar badge de conteo de no leídas
- [ ] Marcar como leídas al hacer clic
- [ ] Desconectar socket al logout

---

## 🚀 Próximos pasos opcionales

- **Push notifications**: Integrar FCM o Web Push API
- **Sonido**: Reproducir un audio cuando llega notificación
- **Persistencia local**: Guardar en localStorage si hay desconexión
- **Retry**: Re-conectar automáticamente si la conexión se pierde
- **Filtros**: Permitir al usuario silenciar ciertos tipos de notificaciones

---

¡Listo! El backend está 100% funcional. Solo falta que implementes la parte del frontend. 🎉

import { getStore } from '@netlify/blobs';
import crypto from 'crypto';

const getSubscriptionKey = (endpoint) => {
    // Erstellt einen eindeutigen, sicheren Schlüssel aus dem Endpoint des Abos
    return crypto.createHash('sha256').update(endpoint).digest('hex');
}

export const handler = async (event) => {
  const subscriptionsStore = getStore('subscriptions');

  // Speichert ein neues Abo
  if (event.httpMethod === 'POST') {
    try {
      const subscription = JSON.parse(event.body);
      if (!subscription || !subscription.endpoint) {
        return { statusCode: 400, body: 'Ungültiges Abo-Objekt' };
      }
      const key = getSubscriptionKey(subscription.endpoint);
      await subscriptionsStore.setJSON(key, subscription);
      return { statusCode: 201, body: JSON.stringify({ message: 'Abo gespeichert.' }) };
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      return { statusCode: 500, body: 'Fehler beim Speichern des Abos.' };
    }
  }

  // Löscht ein beendetes Abo
  if (event.httpMethod === 'DELETE') {
    try {
      const { endpoint } = JSON.parse(event.body);
      if (!endpoint) {
        return { statusCode: 400, body: 'Endpoint fehlt im Request' };
      }
      const key = getSubscriptionKey(endpoint);
      await subscriptionsStore.delete(key);
      return { statusCode: 200, body: JSON.stringify({ message: 'Abo gelöscht.' }) };
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      return { statusCode: 500, body: 'Fehler beim Löschen des Abos.' };
    }
  }

  return { statusCode: 405, body: 'Methode nicht erlaubt' };
};
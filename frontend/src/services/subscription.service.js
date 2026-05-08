import api from "./api";

export const getUserSubscription = async () => {
  const response = await api.get("/subscription");
  return response.data;
};

export const renewSubscription = async (subscriptionId) => {
  const response = await api.post(`/subscriptions/${subscriptionId}/renew`);
  return response.data;
};
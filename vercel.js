const endpoints = ["/api/auth/register",
"/api/auth/login",
"/api/auth/setProfile",
"/api/auth/forgotPassword",
"/api/auth/resetPassword",
"/api/auth/allRooms",
"/api/auth/createRoom",
"/api/auth/deleteRoom",
"/api/auth/joinRoom",
"/api/auth/addMember",
"/api/message/addMessage",
"/api/message/getMessage"];
const allowedOrigin = "https://smartroom-kappa.vercel.app";

const routes = endpoints.map((endpoint) => {
  return {
    src: endpoint,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": true,
    },
  };
});

const vercelConfig = {
  version: 2,
  routes: routes,
};

console.log(JSON.stringify(vercelConfig, null, 2));

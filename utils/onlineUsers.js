// Tek bir Set objesi export ediliyor.
// Böylece tüm import eden yerler aynı referansa erişir.
const onlineUsers = new Set();
module.exports = onlineUsers;
/* Function used in the tests */

module.exports.populateDB = function (db) {
  db.run("INSERT INTO users (id, username, password, access, lastLogin) VALUES ((?), (?), (?), (?), (?))",  1, "root", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 5, Date.now());
  db.run("INSERT INTO users (id, username, password, access, lastLogin) VALUES ((?), (?), (?), (?), (?))",  2, "user1", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 0, Date.now());
  db.run("INSERT INTO users (id, username, password, access, lastLogin) VALUES ((?), (?), (?), (?), (?))",  3, "user2", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 2, Date.now());
  db.run("INSERT INTO users (id, username, password, access, lastLogin) VALUES ((?), (?), (?), (?), (?))",  4, "user3", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 1, Date.now());
  db.run("INSERT INTO users (id, username, password, access, lastLogin, banned) VALUES ((?), (?), (?), (?), (?), (?))",  5, "user4", '$2a$10$QxVaZEiDyKzlQFUSWT3xDuii.WU7Kxj8h7cDaf704XhZ3ZenslpH6', 1, Date.now(), 1);

  db.run("INSERT INTO logins (id, ip, accessed, banned) VALUES ((?), (?), (?), (?))",  1, "555.555.555.555", 45, 1);
  db.run("INSERT INTO logins (id, ip, accessed, threat, lastDate) VALUES ((?), (?), (?), (?), (?))",  2, "555.555.555.444", 59, 50, Date.now() - 4000);
}

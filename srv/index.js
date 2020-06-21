import express from "express";

export default (app) => {
  app.use(express.json());

  let orders = require("./orders.json");
  let errorseries = require("./errorseries.json");
  let orderprod = require("./orderprod.json");

  //★なぜローカルではファイルからデータ取得し本番ではAPIから取得できるのか？
  //リクエストヘッダまたはauth_configで設定している？

  app.get("/api/orders", (req, res) => {
    if (req.query.offset > 1) { return res.json([]); }
    res.json(orders);
  });
  app.get("/api/orderprod", (req, res) => {
    if (req.query.offset > 50000) return res.json([]);
    else return res.json(orderprod);
  });
  app.get("/api/errorseries", (req, res) => {
    if (req.query.offset > 5000) return res.json([]);
    res.json(errorseries);
  });
}
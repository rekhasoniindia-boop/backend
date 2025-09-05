import express from "express";
const router = express.Router();
import Subscriber from "../models/Subscriber.js";

router.post("/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
  
      // check if already subscribed
      const existing = await Subscriber.findOne({ email });
      if (existing) {
        return res.json({ message: "Already subscribed!" });
      }
  
      const newSubscriber = new Subscriber({ email });
      await newSubscriber.save();
  
      res.json({ message: "Thank you for subscribing!" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });

export default router;
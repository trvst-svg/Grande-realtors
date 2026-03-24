import { EventEmitter } from "events";

const auctionEvents = new EventEmitter();
auctionEvents.setMaxListeners(100);

export default auctionEvents;

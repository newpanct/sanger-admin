// 统一出口：所有业务接口从此处导出
// 调用方仍使用 import { xxx } from ".../server/api"，无需改动

export * from "./auth";
export * from "./merchant";
export * from "./scan";
export * from "./statistics";
export * from "./email";
export * from "./wechat";
export * from "./resource";
export * from "./billing";
export * from "./user";
export * from "./link";
export * from "./enterprise";
export * from "./service";
export * from "./deprecated";
export * from "./notice";
export * from "./menu";
export * from "./roleMenu";
export * from "./pay";
export * from "./refundReason";

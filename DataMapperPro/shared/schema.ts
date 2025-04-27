import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const mappings = pgTable("mappings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sourceFormat: text("source_format").notNull(),
  targetFormat: text("target_format").notNull().default("JSON"),
  mappingConfig: jsonb("mapping_config").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mappingHistory = pgTable("mapping_history", {
  id: serial("id").primaryKey(),
  mappingId: integer("mapping_id").references(() => mappings.id),
  sourceFileName: text("source_file_name"),
  targetFileName: text("target_file_name"),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMappingSchema = createInsertSchema(mappings).omit({
  id: true,
  createdAt: true,
});

export const insertMappingHistorySchema = createInsertSchema(mappingHistory).omit({
  id: true,
  processedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMapping = z.infer<typeof insertMappingSchema>;
export type Mapping = typeof mappings.$inferSelect;

export type InsertMappingHistory = z.infer<typeof insertMappingHistorySchema>;
export type MappingHistory = typeof mappingHistory.$inferSelect;

export type Field = {
  path: string;
  name: string;
  type?: string;
  children?: Field[];
};

export type FieldMapping = {
  sourceField: string;
  targetField: string;
  transformation: {
    type: 'direct' | 'lookup' | 'stringManipulation' | 'numberFormat' | 'dateFormat' | 'customScript';
    config?: string;
  };
};

export type MappingConfig = {
  sourceFields: Field[];
  targetFields: Field[];
  fieldMappings: FieldMapping[];
};

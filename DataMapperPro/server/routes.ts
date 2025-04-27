import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertMappingSchema, insertMappingHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - all prefixed with /api
  
  // Mappings CRUD endpoints
  app.get("/api/mappings", async (req: Request, res: Response) => {
    try {
      const mappings = await storage.getAllMappings();
      return res.json(mappings);
    } catch (error) {
      console.error("Error fetching mappings:", error);
      return res.status(500).json({ message: "Failed to fetch mappings" });
    }
  });
  
  app.get("/api/mappings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }
      
      const mapping = await storage.getMapping(id);
      if (!mapping) {
        return res.status(404).json({ message: "Mapping not found" });
      }
      
      return res.json(mapping);
    } catch (error) {
      console.error("Error fetching mapping:", error);
      return res.status(500).json({ message: "Failed to fetch mapping" });
    }
  });
  
  app.post("/api/mappings", async (req: Request, res: Response) => {
    try {
      const result = insertMappingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid mapping data", errors: result.error.format() });
      }
      
      const mapping = await storage.createMapping(result.data);
      return res.status(201).json(mapping);
    } catch (error) {
      console.error("Error creating mapping:", error);
      return res.status(500).json({ message: "Failed to create mapping" });
    }
  });
  
  app.put("/api/mappings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }
      
      // Only validate the fields that are provided
      const validationSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        sourceFormat: z.string().optional(),
        targetFormat: z.string().optional(),
        mappingConfig: z.any().optional(),
      });
      
      const result = validationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid mapping data", errors: result.error.format() });
      }
      
      const updatedMapping = await storage.updateMapping(id, result.data);
      if (!updatedMapping) {
        return res.status(404).json({ message: "Mapping not found" });
      }
      
      return res.json(updatedMapping);
    } catch (error) {
      console.error("Error updating mapping:", error);
      return res.status(500).json({ message: "Failed to update mapping" });
    }
  });
  
  app.delete("/api/mappings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }
      
      const success = await storage.deleteMapping(id);
      if (!success) {
        return res.status(404).json({ message: "Mapping not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting mapping:", error);
      return res.status(500).json({ message: "Failed to delete mapping" });
    }
  });
  
  // Mapping history endpoints
  app.get("/api/mappings/:id/history", async (req: Request, res: Response) => {
    try {
      const mappingId = parseInt(req.params.id);
      if (isNaN(mappingId)) {
        return res.status(400).json({ message: "Invalid mapping ID" });
      }
      
      const history = await storage.getMappingHistoryByMappingId(mappingId);
      return res.json(history);
    } catch (error) {
      console.error("Error fetching mapping history:", error);
      return res.status(500).json({ message: "Failed to fetch mapping history" });
    }
  });
  
  app.post("/api/mapping-history", async (req: Request, res: Response) => {
    try {
      const result = insertMappingHistorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid mapping history data", errors: result.error.format() });
      }
      
      const history = await storage.createMappingHistory(result.data);
      return res.status(201).json(history);
    } catch (error) {
      console.error("Error creating mapping history:", error);
      return res.status(500).json({ message: "Failed to create mapping history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

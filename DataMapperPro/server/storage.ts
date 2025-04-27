import { 
  users, 
  mappings, 
  mappingHistory, 
  type User, 
  type InsertUser, 
  type Mapping, 
  type InsertMapping,
  type MappingHistory,
  type InsertMappingHistory
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mapping operations
  createMapping(mapping: InsertMapping): Promise<Mapping>;
  getMapping(id: number): Promise<Mapping | undefined>;
  getAllMappings(): Promise<Mapping[]>;
  updateMapping(id: number, mapping: Partial<InsertMapping>): Promise<Mapping | undefined>;
  deleteMapping(id: number): Promise<boolean>;
  
  // Mapping history operations
  createMappingHistory(history: InsertMappingHistory): Promise<MappingHistory>;
  getMappingHistoryById(id: number): Promise<MappingHistory | undefined>;
  getMappingHistoryByMappingId(mappingId: number): Promise<MappingHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mappingsData: Map<number, Mapping>;
  private mappingHistoryData: Map<number, MappingHistory>;
  private userId: number;
  private mappingId: number;
  private mappingHistoryId: number;

  constructor() {
    this.users = new Map();
    this.mappingsData = new Map();
    this.mappingHistoryData = new Map();
    this.userId = 1;
    this.mappingId = 1;
    this.mappingHistoryId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Mapping operations
  async createMapping(insertMapping: InsertMapping): Promise<Mapping> {
    const id = this.mappingId++;
    const mapping: Mapping = { 
      ...insertMapping, 
      id, 
      createdAt: new Date() 
    };
    this.mappingsData.set(id, mapping);
    return mapping;
  }

  async getMapping(id: number): Promise<Mapping | undefined> {
    return this.mappingsData.get(id);
  }

  async getAllMappings(): Promise<Mapping[]> {
    return Array.from(this.mappingsData.values());
  }

  async updateMapping(id: number, updateData: Partial<InsertMapping>): Promise<Mapping | undefined> {
    const mapping = this.mappingsData.get(id);
    if (!mapping) return undefined;
    
    const updatedMapping = { ...mapping, ...updateData };
    this.mappingsData.set(id, updatedMapping);
    return updatedMapping;
  }

  async deleteMapping(id: number): Promise<boolean> {
    return this.mappingsData.delete(id);
  }

  // Mapping history operations
  async createMappingHistory(insertHistory: InsertMappingHistory): Promise<MappingHistory> {
    const id = this.mappingHistoryId++;
    const history: MappingHistory = {
      ...insertHistory,
      id,
      processedAt: new Date()
    };
    this.mappingHistoryData.set(id, history);
    return history;
  }

  async getMappingHistoryById(id: number): Promise<MappingHistory | undefined> {
    return this.mappingHistoryData.get(id);
  }

  async getMappingHistoryByMappingId(mappingId: number): Promise<MappingHistory[]> {
    return Array.from(this.mappingHistoryData.values())
      .filter(history => history.mappingId === mappingId);
  }
}

export const storage = new MemStorage();

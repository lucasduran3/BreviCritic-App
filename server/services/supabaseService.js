import supabase from "../config/supabase.js";

class SupabaseService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Devuelve todos los registros de una tabla
   */
  async getAll(table, options = {}) {
    try {
      let query = supabase.from(table).select("*");

      //Aplicar filtros si existen
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      //Aplicar ordenamiento
      if (options.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending !== false,
        });
      }

      //Aplicar limite
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, err } = await query;

      if (err) throw err;

      return data || [];
    } catch (err) {
      console.error(`Error getting all from ${table}: `, err);
      throw err;
    }
  }

  /**
   * Fitra por id
   */
  async getById(table, id) {
    try {
      const { data, err } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

      if (err) {
        if (err.code === "PGRST116") return null; // Not found
        throw err;
      }

      return data;
    } catch (err) {
      console.error(`Error getting ${table} by id:`, err);
      throw err;
    }
  }

  /**
   * Ejecuta query personalizada
   */
  async query(table, queryBuilder) {
    try {
      let query = supabase.from(table).select("*");

      if (queryBuilder) {
        query = queryBuilder(query);
      }

      const { data, err } = await query;

      if (err) throw err;

      return data || [];
    } catch (err) {
      console.error(`Error queryng ${table}:`, err);
      throw err;
    }
  }

  /**
   * Actualiza un registro
   */
  async update(table, id, updates) {
    try {
      const { data, err } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error(`Error updating ${table}:`, err);
      throw err;
    }
  }
}

export default new SupabaseService();

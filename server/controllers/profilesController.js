import supabaseService from "../services/supabaseService.js";

class ProfilesController {
  async getAll(req, res, next) {
    try {
      const profiles = await supabaseService.getAll("profiles");

      res.json({
        success: true,
        count: profiles.length,
        data: profiles,
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await supabaseService.getById("profiles", id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const alowedUpdates = [
        "username",
        "name",
        "lastname",
        "country",
        "city",
        "profile_photo",
      ];

      Object.keys(updates).forEach((key) => {
        if (!alowedUpdates.includes(key)) {
          throw new Error("Este campo no se puede actualizar");
        }
      });

      const updatedUser = await supabaseService.update("profiles", id, updates);

      res.json({
        success: true,
        message: "Usuario actualizado con éxito",
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new ProfilesController();

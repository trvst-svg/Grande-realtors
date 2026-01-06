import pool from "../../DatabaseServices/database.js";

export default function updateLand(req, res){
    const id = req.url.id;

    const findLand = pool.query(
        'SELECT * FROM lands WHERE id = $1',
        [id]
    );

    if (findLand.rowCount() === 0){
        return res.error("Land not found");
    }

    const {
      property_type,
      land_location,
      land_area,
      property_face,
      road_type,
      price,
      road_access,
      land_dimension,
      map_link,
      land_img_url
    } = req.body;

    const updated_property_type = property_type ?? findLand.property_type;
    const updated_land_location = land_location ?? findLand.land_location;
    const updated_land_area = land_area ?? findLand.land_area;
    const updated_property_face = property_face ?? findLand/property_face;
    const updated_road_type = road_type ?? findLand.road_type;
    const updated_price = price ?? findLand.price
    const updated_road_access = road_access ?? findLand.road_access;
    const updated_land_dimension = land_dimension ?? findLand.land_dimension;
    const updated_map_link = map_link ?? findLand.map_link;
    
}
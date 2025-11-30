using Avds_DataAccess.Models;
using Microsoft.Data.SqlClient;
using Microsoft.VisualBasic.FileIO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using static Avds_DataAccess.Repositories.DataAccessSettings;


namespace Avds_DataAccess
{
    public class VehicleData
    {



        // now it dont get all it get just top 100 
        public List<Vehicle> GetAllVehicles()
        {
            List<Vehicle> vehicleList = new List<Vehicle>();

            // 1. Using StringBuilder for better SQL readability and fixing the JOIN issue
            StringBuilder sqlBuilder = new StringBuilder();
            sqlBuilder.AppendLine("SELECT TOP 100 ");
            sqlBuilder.AppendLine("    vd.ID,");
            sqlBuilder.AppendLine("    vd.Vehicle_Display_Name AS VehicleDisplayName,");
            sqlBuilder.AppendLine("    m.Make AS Make,");
            sqlBuilder.AppendLine("    mm.ModelName AS Model,");
            sqlBuilder.AppendLine("    sm.SubModelName AS SubModel,");
            sqlBuilder.AppendLine("    b.BodyName AS Body, ");
            sqlBuilder.AppendLine("    vd.Year,");
            sqlBuilder.AppendLine("    dt.DriveTypeName AS DriveType, ");
            sqlBuilder.AppendLine("    vd.Engine,");
            sqlBuilder.AppendLine("    vd.Engine_CC AS EngineCC,");
            sqlBuilder.AppendLine("    vd.Engine_Cylinders AS EngineCylinders,");
            sqlBuilder.AppendLine("    ft.FuelTypeName AS FuelType,");
            sqlBuilder.AppendLine("    vd.Engine_Liter_Display AS EngineLiterDisplay, ");
            sqlBuilder.AppendLine("    vd.NumDoors,");
            sqlBuilder.AppendLine("    vd.ImagePath ");
            sqlBuilder.AppendLine("FROM VehicleDetails vd ");
            sqlBuilder.AppendLine("JOIN Makes m ON vd.MakeID = m.MakeID ");
            sqlBuilder.AppendLine("JOIN MakeModels mm ON vd.ModelID = mm.ModelID ");
            sqlBuilder.AppendLine("JOIN SubModels sm ON vd.SubModelID = sm.SubModelID ");
            // FIX: Properly separate the JOIN statements
            sqlBuilder.AppendLine("JOIN Bodies b ON vd.BodyID = b.BodyID");
            sqlBuilder.AppendLine("JOIN DriveTypes dt ON vd.DriveTypeID = dt.DriveTypeID ");
            sqlBuilder.AppendLine("JOIN FuelTypes ft ON vd.FuelTypeID = ft.FuelTypeID;");

            string sql = sqlBuilder.ToString();

            // Assuming ConnectionString is accessible (e.g., a class property)
            using (SqlConnection conn = new SqlConnection(ConnectionString))
            {
                try
                {
                    conn.Open();
                    SqlCommand cmd = new SqlCommand(sql, conn);
                    SqlDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        Vehicle vehicle = new Vehicle()
                        {
                            // Basic conversions and null checks remain similar to your original code
                            Id = reader["ID"] != DBNull.Value ? Convert.ToInt32(reader["ID"]) : 0,
                            VehicleDisplayName = reader["VehicleDisplayName"] != DBNull.Value ? reader["VehicleDisplayName"].ToString() : "",
                            Make = reader["Make"] != DBNull.Value ? reader["Make"].ToString() : "",
                            Model = reader["Model"] != DBNull.Value ? reader["Model"].ToString() : "",
                            SubModel = reader["SubModel"] != DBNull.Value ? reader["SubModel"].ToString() : "",
                            Body = reader["Body"] != DBNull.Value ? reader["Body"].ToString() : "",
                            Year = reader["Year"] != DBNull.Value ? Convert.ToInt32(reader["Year"]) : 0,
                            DriveType = reader["DriveType"] != DBNull.Value ? reader["DriveType"].ToString() : "",
                            Engine = reader["Engine"] != DBNull.Value ? reader["Engine"].ToString() : "",
                            EngineCC = reader["EngineCC"] != DBNull.Value ? Convert.ToInt32(reader["EngineCC"]) : 0,
                            EngineCylinders = reader["EngineCylinders"] != DBNull.Value ? Convert.ToInt32(reader["EngineCylinders"]) : 0,
                            FuelType = reader["FuelType"] != DBNull.Value ? reader["FuelType"].ToString() : "",

                            // FIX: Use Convert.ToDecimal to handle the SQL 'money' type correctly
                            EngineLiterDisplay = reader["EngineLiterDisplay"] != DBNull.Value ? Convert.ToDecimal(reader["EngineLiterDisplay"]) : 0.0M,

                            NumDoors = reader["NumDoors"] != DBNull.Value ? Convert.ToInt32(reader["NumDoors"]) : 0,
                            ImagePath = reader["ImagePath"] != DBNull.Value ? reader["ImagePath"].ToString() : ""
                        }; 

                        vehicleList.Add(vehicle);
                    }
                }
                catch (SqlException ex)
                {
                    // It is highly recommended to log the exception (ex) here
                    throw new Exception("Error retrieving vehicle list from database.", ex);
                }
            }
            return vehicleList;
        } 



    }
}

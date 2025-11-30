using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Avds_Buisness
{
    public class VehicleDto
    {
        public VehicleDto() { }

        // Constructor to initialize all properties
        public VehicleDto(int id, string vehicleDisplayName, string make, string model, 
            string subModel, string body, int year, string driveType, string engine, int engineCC,
            int engineCylinders, string fuelType, Decimal engineLiterDisplay, int numDoors, string imagePath)
        {
            Id = id;
            VehicleDisplayName = vehicleDisplayName;
            Make = make;
            Model = model;
            SubModel = subModel;
            Body = body;
            Year = year;
            DriveType = driveType;
            Engine = engine;
            EngineCC = engineCC;
            EngineCylinders = engineCylinders;
            FuelType = fuelType;
            EngineLiterDisplay = engineLiterDisplay;
            NumDoors = numDoors;
            ImagePath = imagePath;
        }

        // Properties
        public int Id { get; set; }
        public string VehicleDisplayName { get; set; }
        public string Make { get; set; }
        public string Model { get; set; }
        public string SubModel { get; set; }
        public string Body { get; set; }
        public int Year { get; set; }
        public string DriveType { get; set; }
        public string Engine { get; set; }
        public int EngineCC { get; set; }
        public int EngineCylinders { get; set; }
        public string FuelType { get; set; }
        public Decimal EngineLiterDisplay { get; set; }
        public int NumDoors { get; set; }
        public string ImagePath { get; set; }

    }
}

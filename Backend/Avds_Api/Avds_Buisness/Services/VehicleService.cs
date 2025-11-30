using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Avds_Buisness;
using Avds_DataAccess;


namespace Avds_Buisness.Services
{
    public class VehicleService
    {

        public VehicleService() { }
        public  List<VehicleDto> GetAllVehicles()
        { 

            var vehiceleData = new VehicleData();
            var vehicles = vehiceleData.GetAllVehicles();
            var vehicleDtos = vehicles.Select(v => new VehicleDto
            (
                v.Id,
                v.VehicleDisplayName,
                v.Make,
                v.Model,
                v.SubModel,
                v.Body,
                v.Year,
                v.DriveType,
                v.Engine,
                v.EngineCC,
                v.EngineCylinders,
                v.FuelType,
                v.EngineLiterDisplay,
                v.NumDoors,
                v.ImagePath
            )).ToList();

            return vehicleDtos;

        }
    }
}

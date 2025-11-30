using Avds_Buisness;
using Avds_Buisness.Services;
using Avds_DataAccess;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Avds_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleController : ControllerBase
    {


        [HttpGet("GetAllVehicles")]
        public ActionResult<List<VehicleDto>> GetAllVehicles()
        {
            var vehicleService = new VehicleService();
            var vehicles = vehicleService.GetAllVehicles();
            return Ok(vehicles);
        }

    }
}
;
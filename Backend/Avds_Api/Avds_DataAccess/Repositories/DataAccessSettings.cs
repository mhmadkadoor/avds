using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Avds_DataAccess.Repositories
{
    static  class DataAccessSettings
    {

        public static string ConnectionString
        {
            get
            {
                return "Server=.;Database=AvdsDB;User Id=sa;Password=123456;TrustServerCertificate=True;";

            }
        }
    }
}

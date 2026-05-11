using System;
using System.Collections.Generic;
using System.Text;

namespace TemperatureLibrary.Repos
{
    public class TemperatureException: Exception
    {
        public TemperatureException(string errMsg): base(errMsg)
        {
            
        }
    }
}

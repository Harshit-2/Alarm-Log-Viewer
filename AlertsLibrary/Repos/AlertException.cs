using System;
using System.Collections.Generic;
using System.Text;

namespace AlertsLibrary.Repos
{
    public class AlertException: Exception
    {
        public AlertException(string errMsg): base(errMsg)
        {
            
        }
    }
}

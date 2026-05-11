using System;
using System.Collections.Generic;
using System.Text;

namespace UserLibrary.Repos
{
    public class UserException: Exception
    {
        public UserException(string errMsg): base(errMsg)
        {
            
        }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace RoomsLibrary.Repos
{
    public class RoomException: Exception
    {
        public RoomException(string errMsg): base(errMsg)
        {
            
        }
    }
}

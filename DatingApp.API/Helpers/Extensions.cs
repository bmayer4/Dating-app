using System;
using Microsoft.AspNetCore.Http;

namespace DatingApp.API.Helpers
{
    public static class Extensions  //static so we don't need to create an instance of this class to use methods
    {
     public static void AddApplicationError(this HttpResponse response, string message) 
     {
         response.Headers.Add("Application-Error", message);  //in event of error, well have this header
         response.Headers.Add("Access-Control-Expose-Headers", "Application-Error");  //this and below allow header to be displayed
         response.Headers.Add("Access-Control-Allow-Origin", "*");
     }   

    public static int CalculateAge(this DateTime theDateTime)
    {
            int age = DateTime.Today.Year - theDateTime.Year;  //2019 - 1984 = 35 (Im am 34)

            if (theDateTime.AddYears(age) > DateTime.Today) //12/14/1984 + 35 years > 1/21/19? yes
            {
                age--;
            }

            return age;
    }

    }
}
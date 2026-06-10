using System.Collections.Generic;

namespace Rhythmix.Application.Common.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public List<string> Errors { get; set; }

        public ApiResponse()
        {
            Errors = new List<string>();
        }

        public static ApiResponse<T> BuildSuccess(T data)
        {
            return new ApiResponse<T> { Success = true, Data = data };
        }

        public static ApiResponse<T> ToSuccess(T data)
        {
            return new ApiResponse<T> { Success = true, Data = data };
        }

        public static ApiResponse<T> BuildFailure(List<string> errors)
        {
            return new ApiResponse<T> { Success = false, Errors = errors };
        }

        public static ApiResponse<T> ToFailure(List<string> errors)
        {
            return new ApiResponse<T> { Success = false, Errors = errors };
        }

        public static ApiResponse<T> BuildFailure(string error)
        {
            return new ApiResponse<T> { Success = false, Errors = new List<string> { error } };
        }

        public static ApiResponse<T> ToFailure(string error)
        {
            return new ApiResponse<T> { Success = false, Errors = new List<string> { error } };
        }
    }
}

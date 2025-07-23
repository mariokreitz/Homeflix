export interface ApiSuccessResponse<DataType extends Object, MetaType extends Object> {
    success: boolean;
    data: DataType;
    meta: MetaType;
}

export interface ApiErrorResponse<DetailsType extends Object> {
    success: boolean;
    error: {
        code: string;
        message: string;
        details?: DetailsType;
    };
}
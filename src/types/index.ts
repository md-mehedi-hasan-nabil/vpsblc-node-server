export interface Disbursement {
    disbursement: string;
    date_paid: string;
    disbursements_paid: string;
    disbursements_expected: string;
    line_chart: string;
    blockchain_tx_url: string;
}

export interface RecentDisbursement {
    most_recent_disbursement: string;
    disbursement_title: string;
    date_paid: Date | "";
    amount_paid: string | 0;
    blockchain_tx_url: string;
}
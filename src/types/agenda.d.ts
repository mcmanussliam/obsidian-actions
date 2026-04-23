/**
 * @see https://crontab.guru/examples.html For more in-depth examples.
 *
 * @example
 * '* * * * *' // At every minute.
 * '0 0 * * *' // At 00:00 every day.
 * '0 0 * * TUE' // At 00:00 on Tuesday.
 * '0 0 * * 6,0' // At 00:00 on Saturday and Sunday.
 */
export type Agenda = string;
